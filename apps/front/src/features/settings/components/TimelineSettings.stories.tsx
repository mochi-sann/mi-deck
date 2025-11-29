import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import {
  type NsfwBehavior,
  timelineSettingsAtom,
} from "../stores/timelineSettings";
import { TimelineSettings } from "./TimelineSettings";

const meta: Meta<typeof TimelineSettings> = {
  title: "Features/Settings/TimelineSettings",
  component: TimelineSettings,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof TimelineSettings>;

const HydrateAtoms = ({
  initialValues,
  children,
}: {
  initialValues: [
    typeof timelineSettingsAtom,
    { nsfwBehavior: NsfwBehavior },
  ][];
  children: React.ReactNode;
}) => {
  useHydrateAtoms(new Map(initialValues));
  return <>{children}</>;
};

const Template = (args: any) => {
  return (
    <Provider>
      <HydrateAtoms
        initialValues={[
          [timelineSettingsAtom, { nsfwBehavior: args.nsfwBehavior }],
        ]}
      >
        <TimelineSettings />
      </HydrateAtoms>
    </Provider>
  );
};

export const Default: Story = {
  render: (args: any) => <Template nsfwBehavior={args.nsfwBehavior} />,
  args: {
    nsfwBehavior: "blur",
  } as any,
};

export const ShowNsfw: Story = {
  render: (args: any) => <Template nsfwBehavior={args.nsfwBehavior} />,
  args: {
    nsfwBehavior: "show",
  } as any,
};

export const HideNsfw: Story = {
  render: (args: any) => <Template nsfwBehavior={args.nsfwBehavior} />,
  args: {
    nsfwBehavior: "hide",
  } as any,
};
