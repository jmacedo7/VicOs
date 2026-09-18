import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getCurrentUserContext } from "@/lib/db/context";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const {supabase,user,membership}=await getCurrentUserContext();
  const {data}=await supabase.from("users").select("id,name,email,avatar_url,job_title,bio,presence").eq("id",user.id).single();
  const avatarUrl=data?.avatar_url ? (await supabase.storage.from("company-assets").createSignedUrl(data.avatar_url,3600)).data?.signedUrl : null;
  return <div className="flex min-h-screen bg-transparent"><DashboardNav active=""/><main className="vicos-mobile-main flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9"><ProfileClient initialProfile={{...data,avatar_signed_url:avatarUrl}} role={membership.role}/></main></div>;
}