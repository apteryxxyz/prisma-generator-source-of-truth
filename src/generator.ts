import { writeFile } from 'node:fs/promises';
import { generatorHandler } from '@prisma/generator-helper';
import CodeBlockWriter from 'code-block-writer';
import { z } from 'zod';
import Zod from './writers/zod';

const Config = z.object({
  createZodSchemas: z.coerce.boolean().default(false),
});
export type Config = z.infer<typeof Config>;

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

    const config = Config.parse(generator.config);
    if (config.createZodSchemas) Zod.write(writer, datamodel);
    await writeFile(generator.output.value, writer.toString());
  },
});
