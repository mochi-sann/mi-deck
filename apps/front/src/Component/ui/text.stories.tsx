import type { Meta, StoryObj } from "@storybook/react";
import Text from "./text";

const meta: Meta<typeof Text> = {
  title: "UI/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p"],
    },
    affects: {
      control: "select",
      options: ["default", "lead", "large", "small", "muted", "removeFiMargin"],
    },
    colorType: {
      control: "select",
      options: ["default", "denger"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "Default text",
  },
};

export const Headings: Story = {
  render: () => (
    <div className="space-y-4">
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
    </div>
  ),
};

export const Paragraph: Story = {
  render: () => (
    <div className="space-y-4">
      <Text variant="p">
        This is a paragraph of text. It demonstrates the default paragraph
        styling with proper line height and spacing.
      </Text>
      <Text variant="p">
        This is another paragraph. Notice the margin between paragraphs.
      </Text>
    </div>
  ),
};

export const TextVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Text affects="lead">
        This is a lead paragraph. It's slightly larger and has a muted color.
      </Text>
      <Text affects="large">This is large text with semibold weight.</Text>
      <Text affects="small">This is small text with medium weight.</Text>
      <Text affects="muted">
        This is muted text, typically used for secondary information.
      </Text>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="space-y-4">
      <Text colorType="default">Default text color</Text>
      <Text colorType="denger">Danger text color</Text>
    </div>
  ),
};

export const WithoutFirstMargin: Story = {
  render: () => (
    <div className="space-y-4">
      <Text affects="removeFiMargin">
        This paragraph has no top margin when it's the first child.
      </Text>
      <Text affects="removeFiMargin">
        This paragraph also has no top margin.
      </Text>
    </div>
  ),
};

export const Combined: Story = {
  render: () => (
    <div className="space-y-6">
      <Text variant="h1">Article Title</Text>
      <Text affects="lead">
        This is the lead paragraph of the article. It provides a brief overview
        of what the article is about.
      </Text>
      <Text variant="h2">First Section</Text>
      <Text variant="p">
        This is the main content of the first section. It contains important
        information about the topic.
      </Text>
      <Text affects="muted">This is a side note with muted styling.</Text>
      <Text variant="h3">Subsection</Text>
      <Text variant="p">
        This is a subsection with more detailed information.
      </Text>
      <Text colorType="denger">This is an important warning message.</Text>
    </div>
  ),
};
