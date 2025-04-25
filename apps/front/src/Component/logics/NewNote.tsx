import { $api } from "@/lib/api/fetchClient";
import { uploadAndCompressFiles } from "@/lib/uploadAndCompresFiles";
import { cn } from "@/lib/utils"; // Import cn utility
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, X } from "lucide-react"; // Import icons
import { APIClient } from "misskey-js/api.js"; // Import UserDetailed
import { useCallback, useEffect, useState } from "react"; // Import useEffect, useCallback
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileUpload } from "../parts/FileUpload";
import { Badge } from "../ui/badge"; // Import Badge
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"; // Import Command components
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; // Import Popover
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

// Define the form schema using Zod
const formSchema = z
  .object({
    serverSessionId: z
      .string({
        // biome-ignore lint/style/useNamingConvention:
        required_error: "投稿先サーバーを選択してください。",
      })
      .nonempty({ message: "投稿先サーバーを選択してください。" }), // Add nonempty validation
    noteContent: z
      .string()
      .min(1, { message: "ノートの内容を入力してください。" }),
    isLocalOnly: z.boolean(),
    visibility: z.enum(["public", "home", "followers", "private"]),
    visibleUserIds: z.array(z.string()).optional(), // Change to array of strings
  })
  .refine(
    (data) => {
      // If visibility is private, visibleUserIds array must not be empty
      if (data.visibility === "private") {
        return data.visibleUserIds && data.visibleUserIds.length > 0;
      }
      return true; // Otherwise, no validation needed
    },
    {
      // Custom error message if validation fails
      message: "ダイレクトメッセージを送る相手を1人以上選択してください。",
      path: ["visibleUserIds"], // Associate the error with the visibleUserIds field
    },
  );

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "home", label: "ホーム" },
  { value: "followers", label: "フォロワー" },
  // { value: "specified", label: "指定ユーザー" }, // specified はUIが複雑になるため一旦除外
  { value: "private", label: "ダイレクト" }, // Add 'private' option
] as const; // as const で value が string literal type になる
type FormSchema = z.infer<typeof formSchema>;

export const NewNote = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserDetailed[]>(
    [],
  );
  const [selectedUsers, setSelectedUsers] = useState<UserDetailed[]>([]); // Store selected user objects
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);

  const { data: serverSessions, isLoading: isLoadingServers } = $api.useQuery(
    "get",
    "/v1/server-sessions",
    {},
    {
      // Keep previous data while loading new server list if needed
      // placeholderData: keepPreviousData,
    },
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverSessionId: "", // Initialize as empty string instead of undefined
      noteContent: "",
      isLocalOnly: false,
      visibility: "public",
      visibleUserIds: [], // Initialize as empty array
    },
  });

  // Watch form fields
  const visibility = form.watch("visibility");
  const selectedServerSessionId = form.watch("serverSessionId");

  // Effect to clear user selection when server changes
  useEffect(() => {
    setSelectedUsers([]);
    setUserSearchResults([]);
    setUserSearchQuery("");
    form.setValue("visibleUserIds", []); // Reset form value as well
  }, [selectedServerSessionId, form]);

  // Handle note submission including file uploads
  async function onSubmit(values: FormSchema) {
    setIsSubmitting(true); // Start submission process
    console.log("Form Submitted:", values);
    const origin =
      serverSessions?.find(
        (serverSession) => serverSession.id === values.serverSessionId,
      )?.origin || "";
    const serverToken =
      serverSessions?.find(
        (serverSession) => serverSession.id === values.serverSessionId,
      )?.serverToken || "";

    const client = new APIClient({
      origin: origin,
      credential: serverToken,
    });

    try {
      // Upload files using the helper function
      const uploadedFileIds = await uploadAndCompressFiles(
        files,
        origin,
        serverToken,
      );

      // Prepare note creation payload
      const notePayload: {
        text: string;
        visibility: FormSchema["visibility"];
        localOnly: boolean;
        fileIds?: string[];
        visibleUserIds?: string[]; // Add visibleUserIds to payload type
      } = {
        text: values.noteContent,
        visibility: values.visibility,
        localOnly: values.isLocalOnly,
        fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      };

      // If visibility is private, add visibleUserIds (already an array)
      if (values.visibility === "private" && values.visibleUserIds) {
        notePayload.visibleUserIds = values.visibleUserIds;
      }

      // Create the note with text and uploaded file IDs
      console.log("Creating note with payload:", notePayload);
      await client.request("notes/create", notePayload);

      console.log("Note created successfully!");
      // TODO: Add success feedback (e.g., close dialog, show toast message)
      form.reset(); // Reset form fields
      setFiles([]);
      setSelectedUsers([]); // Clear selected users UI state
      setUserSearchQuery(""); // Clear search query
      setUserSearchResults([]); // Clear search results
    } catch (err) {
      console.error("Error submitting note or uploading files:", err);
      // TODO: Add user-friendly error feedback
    } finally {
      setIsSubmitting(false);
    }
  }

  // Debounced user search function
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query || !selectedServerSessionId) {
        setUserSearchResults([]);
        return;
      }

      const server = serverSessions?.find(
        (s) => s.id === selectedServerSessionId,
      );
      if (!server) return;

      setIsSearchingUsers(true);
      const client = new APIClient({
        origin: server.origin,
        credential: server.serverToken,
      });
      try {
        // Using users/search - might need adjustment based on Misskey version/instance capabilities
        const results = await client.request("users/search", {
          query: query,
          limit: 10,
        });
        setUserSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserSearchResults([]); // Clear results on error
      } finally {
        setIsSearchingUsers(false);
      }
    },
    [selectedServerSessionId, serverSessions],
  );

  // Effect for debouncing search - basic implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [userSearchQuery, searchUsers]);

  // Handle user selection
  const handleUserSelect = (user: UserDetailed) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      const newSelectedUsers = [...selectedUsers, user];
      setSelectedUsers(newSelectedUsers);
      form.setValue(
        "visibleUserIds",
        newSelectedUsers.map((u) => u.id),
        { shouldValidate: true },
      );
    }
    setUserSearchQuery(""); // Clear search input after selection
    setIsUserPopoverOpen(false); // Close popover
  };

  // Handle user removal
  const handleUserRemove = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    form.setValue(
      "visibleUserIds",
      newSelectedUsers.map((u) => u.id),
      { shouldValidate: true },
    );
  };

  return (
    // Use the Form component from ui/form
    <Form {...form}>
      {/* Pass the form methods and onSubmit handler */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>新しいノートを作成</DialogTitle>
          <DialogDescription>
            ノートの内容を入力してください。
          </DialogDescription>
        </DialogHeader>

        {/* Server Selection Field */}
        <FormField
          control={form.control}
          name="serverSessionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>投稿先サーバー</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value} // Use defaultValue for initial render with Select
                value={field.value} // Controlled value
                disabled={isLoadingServers || !serverSessions}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingServers
                          ? "サーバーを読み込み中..."
                          : "サーバーを選択..."
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serverSessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {/* TODO: Display a more user-friendly name if available, e.g., from serverInfo */}
                      {session.origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公開範囲</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value} // Use defaultValue for initial render with Select
                value={field.value} // Controlled value
                disabled={isLoadingServers || !serverSessions}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={"公開範囲を選択"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibilityOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Conditionally render User Selection when visibility is 'private' */}
        {visibility === "private" && (
          <FormField
            control={form.control}
            name="visibleUserIds" // Keep this linked to the form state
            render={(
              { field }, // field is needed for error message association
            ) => (
              <FormItem className="flex flex-col">
                <FormLabel>宛先ユーザー</FormLabel>
                {/* Display selected users as badges */}
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary">
                      {user.username}
                      {user.host && `@${user.host}`}
                      <button
                        type="button"
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => handleUserRemove(user.id)}
                        aria-label={`Remove ${user.username}`}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover
                  open={isUserPopoverOpen}
                  onOpenChange={setIsUserPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isUserPopoverOpen}
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground", // Use field.value to check if empty for placeholder style
                        )}
                        disabled={!selectedServerSessionId} // Disable if no server selected
                      >
                        {selectedUsers.length > 0
                          ? `${selectedUsers.length}人選択済み`
                          : "ユーザーを検索して追加..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                      {" "}
                      {/* We handle filtering via API */}
                      <CommandInput
                        placeholder="ユーザー名を検索..."
                        value={userSearchQuery}
                        onValueChange={setUserSearchQuery}
                        disabled={isSearchingUsers}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isSearchingUsers
                            ? "検索中..."
                            : "ユーザーが見つかりません。"}
                        </CommandEmpty>
                        <CommandGroup>
                          {userSearchResults.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.username}${user.host ? `@${user.host}` : ""} ${user.id}`} // Unique value for CommandItem
                              onSelect={() => handleUserSelect(user)}
                              disabled={selectedUsers.some(
                                (u) => u.id === user.id,
                              )} // Disable if already selected
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUsers.some((u) => u.id === user.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {user.name} (@{user.username}
                              {user.host && `@${user.host}`})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage /> {/* Display validation errors */}
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="isLocalOnly"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormLabel>ローカルのみ</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value} // Controlled value
                  onCheckedChange={(checked) => field.onChange(checked)} // Update the form state
                  id="isLocalOnly" // Unique ID for the checkbox
                  // {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note Content Field */}
        <FormField
          control={form.control}
          name="noteContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ノート内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ここにノートの内容を入力..."
                  rows={4}
                  {...field} // Spread field props (onChange, onBlur, value, name, ref)
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload Component */}
        <FileUpload files={files} onFilesChange={setFiles} />

        <DialogFooter>
          {/* Disable button while submitting */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
