import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';

export function writeField(w: CodeBlockWriter, f: DMMF.Field) {
  const blocks = parseDocumentation(f.documentation ?? '');
  if (blocks.some((b) => b.type === 'import'))
    throw new Error('Fields cannot import');
  if (blocks.some((b) => b.type === 'declare'))
    throw new Error('Fields cannot declare');
  if (blocks.some((b) => b.type === 'export'))
    throw new Error('Fields cannot export');

  // TODO: JSDoc

  const zod = blocks.find((b) => b.type === 'zod');
  if (zod?.kind === 'replace') {
    w.quote(f.name).write(': z.').write(zod.schema).write(',').newLine();
  } else if (zod?.kind === 'extend') {
    writeBaseScalarField(w, f);
    w.write(`.${zod.schema}`);
    writePostScalarField(w, f);
  } else if (f.kind === 'scalar') {
    writeBaseScalarField(w, f);
    writePostScalarField(w, f);
  } else if (f.kind === 'enum') {
    w.quote(f.name).write(': ').write(f.type);
    writePostScalarField(w, f);
  } else if (f.kind === 'object') {
    w.writeLine(`// ${f.name} is an object field`);
  } else {
    throw new Error(`Unsupported field kind: ${f.kind}`);
  }
}

function writeBaseScalarField(w: CodeBlockWriter, f: DMMF.Field) {
  w.quote(f.name).write(': z.');
  switch (f.type) {
    case 'String':
      w.write('string()');
      if (f.isRequired) w.write('.min(1)');
      if (Reflect.get(f.default ?? {}, 'name') === 'uuid') w.write('.uuid()');
      if (Reflect.get(f.default ?? {}, 'name') === 'cuid') w.write('.cuid()');
      break;
    case 'Int':
      w.write('number().int()');
      break;
    case 'Boolean':
      w.write('boolean()');
      break;
    case 'DateTime':
      w.write('date()');
      break;
    case 'Float':
      w.write('number()');
      break;
    case 'BigInt':
      w.write('bigint()');
      break;
    default:
      throw new Error(`Unsupported scalar type: ${f.type}`);
  }
}

function writePostScalarField(w: CodeBlockWriter, f: DMMF.Field) {
  if (f.isList) w.write('.array()');
  if (!f.isRequired) w.write('.nullable()');
  if (!f.isRequired) w.write('.optional()');
  w.write(',').newLine();
}
