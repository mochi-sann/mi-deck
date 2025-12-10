import type { TFunction } from "i18next";
import { Check, ImagePlus, Server, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomEmojiPicker } from "@/features/timeline/components/CustomEmojiPicker";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import type { NoteComposerFormValues } from "../../hooks/useNoteComposer";

interface ComposerFieldActionsProps {
  t: TFunction<"notes">;
  serversWithToken: MisskeyServerConnection[];
  visibilityOptions: {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  isServerPopoverOpen: boolean;
  onServerPopoverChange: (open: boolean) => void;
  isVisibilityPopoverOpen: boolean;
  onVisibilityPopoverChange: (open: boolean) => void;
  isEmojiPickerOpen: boolean;
  onEmojiPickerChange: (open: boolean) => void;
  formDisabled: boolean;
  isLoadingServers: boolean;
  selectedServer?: MisskeyServerConnection;
  serverButtonLabel: string;
  visibilityButtonLabel: string;
  currentVisibility: string;
  emojiOrigin: string;
  canUseEmoji: boolean;
  onServerSelect: (serverId: string) => void;
  onVisibilitySelect: (
    visibility: NoteComposerFormValues["visibility"],
  ) => void;
  onEmojiSelect: (emojiName: string) => void;
  onOpenFileSelector: () => void;
  getServerDisplayName: (server: MisskeyServerConnection) => string;
  getServerSubtitle: (server: MisskeyServerConnection) => string;
}

export function ComposerFieldActions({
  t,
  serversWithToken,
  visibilityOptions,
  isServerPopoverOpen,
  onServerPopoverChange,
  isVisibilityPopoverOpen,
  onVisibilityPopoverChange,
  isEmojiPickerOpen,
  onEmojiPickerChange,
  formDisabled,
  isLoadingServers,
  selectedServer,
  serverButtonLabel,
  visibilityButtonLabel,
  currentVisibility,
  emojiOrigin,
  canUseEmoji,
  onServerSelect,
  onVisibilitySelect,
  onEmojiSelect,
  onOpenFileSelector,
  getServerDisplayName,
  getServerSubtitle,
}: ComposerFieldActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Popover open={isServerPopoverOpen} onOpenChange={onServerPopoverChange}>
        <PopoverTrigger asChild>
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={serverButtonLabel}
            title={serverButtonLabel}
            disabled={
              formDisabled || isLoadingServers || serversWithToken.length === 0
            }
          >
            {selectedServer ? (
              <Avatar className="size-5">
                <AvatarImage
                  src={selectedServer.userInfo?.avatarUrl}
                  alt={getServerDisplayName(selectedServer)}
                />
                <AvatarFallback>
                  {getServerDisplayName(selectedServer)
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Server className="size-4" />
            )}
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          {serversWithToken.length === 0 ? (
            <div className="p-4 text-muted-foreground text-sm">
              {t("compose.error.noServer")}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto p-1">
              {serversWithToken.map((server) => {
                const serverName = getServerDisplayName(server);
                const subtitle = getServerSubtitle(server);
                const isActive = selectedServer?.id === server.id;
                return (
                  <button
                    key={server.id}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-muted" : "hover:bg-muted/80"}`}
                    onClick={() => {
                      onServerSelect(server.id);
                      onServerPopoverChange(false);
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      {server.userInfo?.avatarUrl ? (
                        <AvatarImage
                          src={server.userInfo.avatarUrl}
                          alt={serverName}
                        />
                      ) : (
                        <AvatarFallback>
                          {serverName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{serverName}</span>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        {server.serverInfo?.iconUrl && (
                          <img
                            src={server.serverInfo.iconUrl}
                            alt={server.serverInfo.name}
                            className="size-3 rounded-full"
                          />
                        )}
                        <span>{subtitle}</span>
                      </div>
                    </div>
                    <Check
                      className={`ml-auto size-4 text-primary ${isActive ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Popover
        open={isVisibilityPopoverOpen}
        onOpenChange={onVisibilityPopoverChange}
      >
        <PopoverTrigger asChild>
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={visibilityButtonLabel}
            title={visibilityButtonLabel}
            disabled={formDisabled}
          >
            {(() => {
              const VisibilityIcon =
                visibilityOptions.find(
                  (option) => option.value === currentVisibility,
                )?.icon ?? visibilityOptions[0].icon;
              return <VisibilityIcon className="size-4" />;
            })()}
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="end">
          <div className="p-1">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${option.value === currentVisibility ? "bg-muted" : "hover:bg-muted/80"}`}
                onClick={() => {
                  onVisibilitySelect(
                    option.value as NoteComposerFormValues["visibility"],
                  );
                  onVisibilityPopoverChange(false);
                }}
              >
                <option.icon className="size-4 text-muted-foreground" />
                <span>{option.label}</span>
                <Check
                  className={`ml-auto size-4 text-primary ${option.value === currentVisibility ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isEmojiPickerOpen} onOpenChange={onEmojiPickerChange}>
        <PopoverTrigger asChild>
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={!canUseEmoji || formDisabled}
            aria-label={t("compose.emojiInsert")}
            title={t("compose.emojiInsert")}
          >
            <Smile className="size-4" />
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
          {canUseEmoji ? (
            <CustomEmojiPicker
              origin={emojiOrigin}
              onEmojiSelect={(name) => {
                onEmojiSelect(name);
                onEmojiPickerChange(false);
              }}
            />
          ) : (
            <div className="p-4 text-muted-foreground text-sm">
              {t("compose.emojiPickerPlaceholder")}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <InputGroupButton
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={t("compose.attachmentsLabel")}
        title={t("compose.attachmentsLabel")}
        disabled={formDisabled}
        onClick={onOpenFileSelector}
      >
        <ImagePlus className="size-4" />
      </InputGroupButton>
    </div>
  );
}
