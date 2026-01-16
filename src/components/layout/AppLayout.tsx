import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Church, CalendarPlus, Moon, Sun, CreditCard, Droplets } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-lg warm-gradient flex items-center justify-center shrink-0">
              <Church className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm truncate">Lords Church Admin</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/create-event')}
                    isActive={location.pathname === '/create-event'}
                    tooltip="Create Events"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    <span>Create Events</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/baptism-requests')}
                    isActive={location.pathname === '/baptism-requests'}
                    tooltip="Baptism Requests"
                  >
                    <Droplets className="h-4 w-4" />
                    <span>Baptism Requests</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate('/payment-link')}
                    isActive={location.pathname === '/payment-link'}
                    tooltip="Payment Link"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Link</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-sidebar-border">
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="ml-2 group-data-[collapsible=icon]:hidden">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="ml-2 group-data-[collapsible=icon]:hidden">Dark Mode</span>
                </>
              )}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger />
          <div className="flex-1">
            <Header />
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
