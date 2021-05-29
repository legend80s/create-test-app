interface IOptions {
  verbose: boolean;
  silent: boolean;
  dryRun: boolean;
  coverage: boolean;
  type: 'js' | 'ts';

  /** json5 string */
  transform: string;
}
