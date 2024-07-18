import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';
import { writeField } from './field';

export function writeModel(writer: CodeBlockWriter, data: DMMF.Model) {
  writer
    .newLine()
    .writeLine(`// ===== ${data.name} Zod Schema ===== //`)
    .newLine();

  const blocks = parseDocumentation(data.documentation ?? '');
  for (const i of blocks.filter((b) => b.type === 'import'))
    writer.writeLine(`import ${i.what} from '${i.from}'`);
  for (const d of blocks.filter((b) => b.type === 'declare'))
    writer.writeLine(`const ${d.as} = ${d.what}`);

  const zod = blocks.find((b) => b.type === 'zod');
  if (zod && zod.kind !== 'extend')
    throw new Error('Model can only be extended with zod');

  // TODO: JSDoc

  writer
    .write(`export const ${data.name} = ZodEffects(z.object({`)
    // biome-ignore lint/complexity/noForEach: <explanation>
    .indent(() => data.fields.forEach((f) => writeField(writer, f)))
    .write('}), d => d')
    .conditionalWrite(Boolean(zod), () => `.${zod!.schema}`)
    .write(')');

  writer.writeLine(`export type ${data.name} = z.infer<typeof ${data.name}>`);

  for (const e of blocks.filter((b) => b.type === 'export'))
    writer.writeLine(`export { ${e.what} }`);
}
