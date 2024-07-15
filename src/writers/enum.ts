import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { parseDocumentation } from '~/parsers/documentation';

export function writeEnum(w: CodeBlockWriter, e: DMMF.DatamodelEnum) {
  w.newLine().writeLine(`// ==== ${e.name} ==== //`).newLine();

  // TODO: JSDoc

  const blocks = parseDocumentation(e.documentation ?? '');
  for (const i of blocks.filter((b) => b.type === 'import'))
    w.writeLine(`import ${i.what} from '${i.from}'`);
  for (const d of blocks.filter((b) => b.type === 'declare'))
    w.writeLine(`const ${d.as} = ${d.what}`);

  w.write(`export const ${e.name} = z.enum([`);
  for (const value of e.values) w.quote(value.name).write(', ');
  w.write('])').newLine();
  w.writeLine(`export type ${e.name} = z.infer<typeof ${e.name}>`);

  for (const e of blocks.filter((b) => b.type === 'export'))
    w.writeLine(`export { ${e.what} }`);
}
