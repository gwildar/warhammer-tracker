import Navigo from "navigo";

export const router = new Navigo("/", { hash: true });

export function navigate(path) {
  router.navigate(path);
}
