import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { writeZodEffects } from './effects';
import { writeEnum } from './enum';
import { writeModel } from './model';

namespace Zod {
  export function write(writer: CodeBlockWriter, data: DMMF.Datamodel) {
    writer.writeLine(`import { z } from 'zod';`);
    writeZodEffects(writer);
    for (const e of data.enums) writeEnum(writer, e);
    for (const m of data.models) writeModel(writer, m);
  }
}

export default Zod;
