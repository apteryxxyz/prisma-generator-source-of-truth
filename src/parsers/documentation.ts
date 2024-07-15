export function parseDocumentation(documentation: string) {
  const lines = documentation.split(/\r?\n/);
  const others: string[] = [];
  const blocks: Block[] = [];

  for (const line of lines) {
    if (line.startsWith('@import(')) {
      const match = line.match(/@import\(([^,]+), '([^']+)'\)/)!;
      const [, what, from] = match as [string, string, string];
      blocks.push({ type: 'import', from, what });
    } else if (line.startsWith('@declare(')) {
      const match = line.match(/@declare\('([^']+)'\s*,\s*(.+)\)/)!;
      const [, as, what] = match as [string, string, string];
      blocks.push({ type: 'declare', as, what });
    } else if (line.startsWith('@export(')) {
      const match = line.match(/@export\('([^']+)'\)/)!;
      const [, what] = match as [string, string];
      blocks.push({ type: 'export', what });
    } else if (line.startsWith('@zod(')) {
      const match = line.match(/@zod\((z|this)\.(.+)\)/);
      const [, _kind, schema] = match as [string, 'z' | 'this', string];
      const kind = _kind === 'z' ? 'replace' : 'extend';
      blocks.push({ type: 'zod', kind, schema });
    } else {
      others.push(line);
    }
  }

  if (others.length) blocks.push({ type: 'other', text: others });
  return blocks;
}

export type Block =
  | {
      // @import([what], [from])
      type: 'import';
      from: string;
      what: string;
    }
  | {
      /// @declare([as], [what]) (what can have brackets)
      type: 'declare';
      what: string;
      as: string;
    }
  | {
      /// @export([what])
      type: 'export';
      what: string;
    }
  | {
      /// @zod(z.[schema]) (replace) or @zod(this.[schema]) (extend)
      type: 'zod';
      kind: 'replace' | 'extend';
      schema: string;
    }
  | {
      type: 'other';
      text: string[];
    };
