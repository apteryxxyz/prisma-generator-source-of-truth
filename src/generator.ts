import { writeFile } from 'node:fs/promises';
import { generatorHandler } from '@prisma/generator-helper';
import CodeBlockWriter from 'code-block-writer';
import { write } from './writers';

generatorHandler({
  onManifest(config) {
    return {
      ...config,
      prettyName: 'Source of Truth',
    };
  },

  async onGenerate({ generator, dmmf: { datamodel } }) {
    if (!generator.output?.value)
      throw new Error('Generator is missing output configuration');

    const writer = new CodeBlockWriter({
      newLine: '\n',
      indentNumberOfSpaces: 2,
      useTabs: false,
      useSingleQuote: true,
    });

    write(writer, datamodel);
    await writeFile(generator.output.value, writer.toString());
  },
});
