import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';
import { writeField } from './field';

export function writeModel(w: CodeBlockWriter, m: DMMF.Model) {
  w.newLine().writeLine(`// ==== ${m.name} ==== //`).newLine();

  const blocks = parseDocumentation(m.documentation ?? '');
  for (const i of blocks.filter((b) => b.type === 'import'))
    w.writeLine(`import ${i.what} from '${i.from}'`);
  for (const d of blocks.filter((b) => b.type === 'declare'))
    w.writeLine(`const ${d.as} = ${d.what}`);

  const zod = blocks.find((b) => b.type === 'zod');
  if (zod && zod.kind !== 'extend')
    throw new Error('Model can only be extended with zod');

  // TODO: JSDoc

  w.write(`export const ${m.name} = z.object({`);
  // biome-ignore lint/complexity/noForEach: <explanation>
  w.indent(() => m.fields.forEach((f) => writeField(w, f)));
  w.write('})');
  w.conditionalWrite(Boolean(zod), () => `.${zod!.schema}`);

  w.writeLine(`export type ${m.name} = z.infer<typeof ${m.name}>`);

  for (const e of blocks.filter((b) => b.type === 'export'))
    w.writeLine(`export { ${e.what} }`);
}
