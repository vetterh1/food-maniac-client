cd ./workspace/food-maniac-client/
rm distFoServer/bundle.*
rm distFoServer/main.*
rm distFoServer/manifest.*
rm distFoServer/styles.*
rm distFoServer/vendor.*
pm2 stop foServer
pm2 delete foServer
git pull
npm install
NODE_ENV=production  npm run build:prod
pm2 start pm2config.json --env production
