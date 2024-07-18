import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';

export function writeField(writer: CodeBlockWriter, data: DMMF.Field) {
  const blocks = parseDocumentation(data.documentation ?? '');
  if (blocks.some((b) => b.type === 'import'))
    throw new Error('Fields cannot import');
  if (blocks.some((b) => b.type === 'declare'))
    throw new Error('Fields cannot declare');
  if (blocks.some((b) => b.type === 'export'))
    throw new Error('Fields cannot export');

  // TODO: JSDoc

  const zod = blocks.find((b) => b.type === 'zod');
  if (zod?.kind === 'replace') {
    writer
      .quote(data.name)
      .write(': z.')
      .write(zod.schema)
      .write(',')
      .newLine();
  } else if (zod?.kind === 'extend') {
    writeBaseScalarField(writer, data);
    writer.write(`.${zod.schema}`);
    writePostScalarField(writer, data);
  } else if (data.kind === 'scalar') {
    writeBaseScalarField(writer, data);
    writePostScalarField(writer, data);
  } else if (data.kind === 'enum') {
    writer.quote(data.name).write(': ').write(data.type);
    writePostScalarField(writer, data);
  } else if (data.kind === 'object') {
    writer.writeLine(`// ${data.name} is an object field`);
  } else {
    throw new Error(`Unsupported field kind: ${data.kind}`);
  }
}

function writeBaseScalarField(writer: CodeBlockWriter, data: DMMF.Field) {
  writer.quote(data.name).write(': z.');
  switch (data.type) {
    case 'String':
      writer.write('string()');
      if (data.isRequired) writer.write('.min(1)');
      if (Reflect.get(data.default ?? {}, 'name') === 'uuid')
        writer.write('.uuid()');
      if (Reflect.get(data.default ?? {}, 'name') === 'cuid')
        writer.write('.cuid()');
      break;
    case 'Int':
      writer.write('number().int()');
      break;
    case 'Boolean':
      writer.write('boolean()');
      break;
    case 'DateTime':
      writer.write('date()');
      break;
    case 'Float':
      writer.write('number()');
      break;
    case 'BigInt':
      writer.write('bigint()');
      break;
    default:
      throw new Error(`Unsupported scalar type: ${data.type}`);
  }
}

function writePostScalarField(writer: CodeBlockWriter, data: DMMF.Field) {
  if (data.isList) writer.write('.array()');
  if (!data.isRequired) writer.write('.nullable()');
  if (!data.isRequired) writer.write('.optional()');
  writer.write(',').newLine();
}
