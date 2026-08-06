import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirrectMessageList from "../chat/DirrectMessageList";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-primary"
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">Mango</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80" />
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-background/80"
                    />
                    <Moon className="size-4 text-white/80" />
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* content */}
      <SidebarContent className="beautiful-scrollbar">
        {/* new chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* group chat */}
        <SidebarGroup>
          <div className="flex justify-between">
            <SidebarGroupLabel className="uppercase">
              Group chat
            </SidebarGroupLabel>

            {/* tao nhom chat */}
            <div className="flex items-center justify-between">
              <NewGroupChatModal />
            </div>
          </div>

          {/* danh sach nhom chat */}
          <SidebarGroupContent>
            <GroupChatList />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* direct chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            direct chat
          </SidebarGroupLabel>
          <SidebarGroupAction title="ket ban" className="cursor-pointer">
            <AddFriendModal />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <DirrectMessageList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* footer */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
