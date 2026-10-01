import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const repositoryRoot = process.cwd();
const examplesRoot = path.join(repositoryRoot, 'src/examples');
const publicRoot = path.join(repositoryRoot, 'public');
const exampleDirectories = (await readdir(examplesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const errors = [];

async function getSourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getSourceFiles(entryPath)));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

function isRelativeModuleSpecifier(specifier) {
  return (
    specifier === '.' ||
    specifier === '..' ||
    specifier.startsWith('./') ||
    specifier.startsWith('../') ||
    specifier.startsWith('.\\') ||
    specifier.startsWith('..\\')
  );
}

function isInsideDirectory(directory, target) {
  const relativePath = path.relative(directory, target);
  return (
    relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath))
  );
}

function getModuleSpecifiers(sourceFile) {
  const specifiers = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      specifiers.push(node.argument.literal.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return specifiers;
}

function getDatasetReferences(sourceFile) {
  const references = [];
  function visit(node) {
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      node.text.startsWith('datasets/')
    ) {
      references.push(node.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return references;
}

for (const exampleName of exampleDirectories) {
  const exampleDirectory = path.join(examplesRoot, exampleName);
  const manifestPath = path.join(exampleDirectory, 'datasets.json');
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    errors.push(
      `ERROR: ${path.relative(repositoryRoot, manifestPath)} must exist and contain valid JSON (${error.message})`,
    );
    continue;
  }

  if (!Array.isArray(manifest) || manifest.some((datasetPath) => typeof datasetPath !== 'string')) {
    errors.push(
      `ERROR: ${path.relative(repositoryRoot, manifestPath)} must contain only a JSON array of strings`,
    );
    continue;
  }

  const datasetPaths = new Set();
  for (const datasetPath of manifest) {
    if (datasetPaths.has(datasetPath)) {
      errors.push(
        `ERROR: ${path.relative(repositoryRoot, manifestPath)} contains duplicate path "${datasetPath}"`,
      );
    }
    datasetPaths.add(datasetPath);

    if (
      !datasetPath ||
      path.isAbsolute(datasetPath) ||
      path.win32.isAbsolute(datasetPath) ||
      datasetPath.includes('..') ||
      datasetPath.startsWith('public/') ||
      datasetPath.startsWith('public\\') ||
      datasetPath.includes('\\')
    ) {
      errors.push(
        `ERROR: ${path.relative(repositoryRoot, manifestPath)} contains invalid dataset path "${datasetPath}"`,
      );
      continue;
    }

    const datasetFile = path.resolve(publicRoot, datasetPath);
    try {
      if (!isInsideDirectory(publicRoot, datasetFile) || !(await stat(datasetFile)).isFile()) {
        errors.push(
          `ERROR: dataset "${datasetPath}" in ${path.relative(repositoryRoot, manifestPath)} is not a file under public/`,
        );
      }
    } catch {
      errors.push(
        `ERROR: dataset "${datasetPath}" in ${path.relative(repositoryRoot, manifestPath)} does not exist as a file under public/`,
      );
    }
  }

  for (const filePath of await getSourceFiles(exampleDirectory)) {
    const source = await readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    for (const specifier of getModuleSpecifiers(sourceFile)) {
      if (!isRelativeModuleSpecifier(specifier)) continue;
      const normalizedSpecifier = specifier.replaceAll('\\', path.sep);
      const resolvedPath = path.resolve(path.dirname(filePath), normalizedSpecifier);
      if (!isInsideDirectory(exampleDirectory, resolvedPath)) {
        errors.push(`ERROR: ${path.relative(repositoryRoot, filePath)} imports ${specifier}`);
      }
    }

    for (const datasetPath of getDatasetReferences(sourceFile)) {
      if (!datasetPaths.has(datasetPath)) {
        errors.push(
          `ERROR: ${path.relative(repositoryRoot, filePath)} references "${datasetPath}" but it is not listed in datasets.json`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated migration readiness for ${exampleDirectories.length} examples.`);
}
