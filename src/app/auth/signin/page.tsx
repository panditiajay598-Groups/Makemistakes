import { redirect } from "next/navigation";

export default function AuthSigninRedirect() {
  redirect("/auth/student/login");
}
