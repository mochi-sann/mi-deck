import { MenuFieldSet } from "@/components/forms/MenuFieldSet";
import { TextFieldSet } from "@/components/forms/TextFieldSet";
import { Button } from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useStorage } from "@/lib/storage/context";
import type { MisskeyServerConnection } from "@/lib/storage/types";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";

type CreateTimelineFormType = {
  serverId: string;
  name: string;
  type: "home" | "local" | "social" | "global";
};

const schema = v.object({
  serverId: v.pipe(v.string(), v.minLength(1, "Server is required.")),
  name: v.pipe(v.string(), v.minLength(1, "Timeline name is required.")),
  type: v.union(
    [
      v.literal("home"),
      v.literal("local"),
      v.literal("social"),
      v.literal("global"),
    ],
    "Timeline type is required.",
  ),
});

type CreateTimelineFormProps = {
  servers: MisskeyServerConnection[];
};
export function CreateTimelineForm(props: CreateTimelineFormProps) {
  const { addTimeline } = useStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTimelineFormType>({
    resolver: valibotResolver(schema),
    defaultValues: {
      serverId: "",
      name: "",
      type: "home",
    },
  });

  // Handle form submission

  // Display loading state while fetching server sessions

  // Prepare options for the server dropdown
  const serverOptions = props.servers.map((server) => ({
    label: server.serverInfo?.name || new URL(server.origin).hostname,
    value: server.id,
  }));

  const timelineTypeOptions = [
    { label: "Home", value: "home" },
    { label: "Local", value: "local" },
    { label: "Social", value: "social" },
    { label: "Global", value: "global" },
  ];

  const onSubmit = async (data: CreateTimelineFormType) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const timelineCount = 0; // This would need proper calculation
      await addTimeline({
        serverId: data.serverId,
        name: data.name,
        type: data.type,
        order: timelineCount,
        isVisible: true,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create timeline.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MenuFieldSet
        control={control}
        name="serverId"
        label="Server"
        placeholder="Select a server"
        collection={serverOptions}
        validation={errors.serverId?.message ?? ""}
      />

      <TextFieldSet
        control={control}
        name="name"
        label="Timeline Name"
        placeholder="Enter timeline name"
        type="text"
        validation={errors.name?.message ?? ""}
      />

      <MenuFieldSet
        control={control}
        name="type"
        label="Timeline Type"
        placeholder="Select timeline type"
        collection={timelineTypeOptions}
        validation={errors.type?.message ?? ""}
      />

      <Button type="submit" isLoading={isLoading} buttonWidth={"full"}>
        Create Timeline
      </Button>

      {error && <Text colorType={"denger"}>Error: {error}</Text>}
      {success && (
        <Text colorType={"default"}>Timeline created successfully!</Text>
      )}
    </form>
  );
}
