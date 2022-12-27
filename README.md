# gp-shop

Merry Christmas!

Shop Plugin for the Athena Framework 4.X.X

Reworked OSS Shop from Der Lord! Many thanks!

In Development and not fully tested, yet. You can help by opening issues or create pull requests.

##Features

1. Easly configure shops with your items
2. Peds for shops
3. Tested with over 200 items

#ATTENTION: There was a bug in last version, where all shops will recreated on server restart. This is fixed now, but you need to delete all shops in your database.

##Plans for next year

1. Integrate faction system with storage for playable shops
2. Price configuration per Item, currently same price for each item
3. Optimize performance, on big shops the UI will need too much time to open.

## Installation

1. Open a command prompt in your main Athena Directory.
2. Navigate to the plugins folder.

```ts
cd src/core/plugins
```

3. Copy the command below.

**SSH**

```
git clone git@github.com:jonasesser/gp-shop.git
```

**HTTPS**

```
git clone https://github.com/jonasesser/gp-shop.git
```

6. Configure your shops in shopRegistry.ts and replace all item lists with your personalized items.

7. Start the Server
