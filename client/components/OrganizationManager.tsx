"use client";

import { OrganizationSwitcher, CreateOrganization } from "@clerk/nextjs";

export function OrganizationManager() {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Switch Organization
        </h3>
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          afterSelectPersonalUrl="/dashboard"
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "py-2 px-4 border border-border rounded-lg bg-card text-foreground w-full",
            },
          }}
          organizationProfileProps={{
            appearance: {
              elements: {
                cardBox:
                  "bg-card text-card-foreground shadow-xl border border-border",
                modalBackdrop: "bg-black/60 backdrop-blur-sm",
                rootBox: "bg-card",
                page: "bg-card",
                navbar: "bg-muted border-r border-border",
                profileSection: "bg-card",
                profilePage: "bg-card",
              },
            },
          }}
        />
      </div>
      <div className='flex flex-col' >
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Create New Organization
        </h3>
        <div className="mx-auto">
          <CreateOrganization
            afterCreateOrganizationUrl="/dashboard"
            skipInvitationScreen
          />
        </div>
      </div>
    </div>
  );
}
