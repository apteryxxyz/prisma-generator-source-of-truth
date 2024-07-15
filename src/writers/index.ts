import type { DMMF } from '@prisma/generator-helper';
import type CodeBlockWriter from 'code-block-writer';
import { writeEnum } from './enum';
import { writeModel } from './model';

export function write(w: CodeBlockWriter, s: DMMF.Datamodel) {
  w.writeLine(`import { z } from 'zod';`);
  for (const e of s.enums) writeEnum(w, e);
  for (const m of s.models) writeModel(w, m);
}
