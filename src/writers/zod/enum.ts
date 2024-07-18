import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';

export function writeEnum(writer: CodeBlockWriter, data: DMMF.DatamodelEnum) {
  writer
    .newLine()
    .writeLine(`// ===== ${data.name} Zod Schema ===== //`)
    .newLine();

  // TODO: JSDoc

  const blocks = parseDocumentation(data.documentation ?? '');
  for (const i of blocks.filter((b) => b.type === 'import'))
    writer.writeLine(`import ${i.what} from '${i.from}'`);
  for (const d of blocks.filter((b) => b.type === 'declare'))
    writer.writeLine(`const ${d.as} = ${d.what}`);

  writer.write(`export const ${data.name} = z.enum([`);
  for (const value of data.values) writer.quote(value.name).write(', ');
  writer
    .write('])')
    .writeLine(`export type ${data.name} = z.infer<typeof ${data.name}>`);

  for (const e of blocks.filter((b) => b.type === 'export'))
    writer.writeLine(`export { ${e.what} }`);
}
