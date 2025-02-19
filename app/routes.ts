import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("user/:id", "routes/user.tsx")
] satisfies RouteConfig;
