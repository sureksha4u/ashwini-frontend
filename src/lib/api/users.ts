import { apiFetch } from "./client";
import type { UserResponse, UserInvite, UserOnboard, UserInviteResponse } from "@/lib/types";

export async function inviteUser(data: UserInvite): Promise<UserInviteResponse> {
  return apiFetch<UserInviteResponse>("/users/invite", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function onboardUser(data: UserOnboard): Promise<{ message: string; email: string }> {
  return apiFetch<{ message: string; email: string }>("/users/onboard", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<UserResponse> {
  return apiFetch<UserResponse>("/users/me");
}
