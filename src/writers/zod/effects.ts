import type CodeBlockWriter from 'code-block-writer';

export function writeZodEffects(writer: CodeBlockWriter) {
  writer
    .write(
      `export function ZodEffects<
  TSource extends z.ZodTypeAny,
  TEffectReturn extends z.ZodTypeAny,
>(
  source: TSource,
  effect: (source: TSource) => TEffectReturn,
) {
  return Object.assign(effect(source), { source, effect });
}`.trim(),
    )
    .newLine();
}
