import { createConnection } from 'typeorm';

// (async () => await createConnection())();
createConnection().then(() => console.log("Connected")).catch((e) => console.log(e))
