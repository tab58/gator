# slack-app-template

A template written in TypeScript for creating and developing Slack applications and integrations.

## Dependencies

- ngrok (with PATH variable pointing to it)

## Usage

`npm run devstart` will start an ngrok session and feed the public URL to the application `src/index.ts` as the first command line argument.

```
>>> ts-node ./src/index.ts <NGROK_URL>
```

This is hot reloadable so that the ngrok URL doesn't have to change between edits.

## Author
Tim Bright, 2019.