import * as Linking from "expo-linking";
import type { LinkingOptions } from "@react-navigation/native";

const linking: LinkingOptions<{}> = {
  prefixes: [Linking.createURL("/"), "resqapp://"], // Ensure scheme matches `app.json`
  config: {
    screens: {
      "(auth)": {
        screens: {
          login: "login",
          signup: "signup",
          verify: "verify",
          "forgot-password": "forgot-password",
        },
      },
      "(app)": {
        screens: {
          home: "home",
        },
      },
      notfound: "*",
    },
  },
};

export default linking;
