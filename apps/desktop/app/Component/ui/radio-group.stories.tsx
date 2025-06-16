import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="card">
      <div className="grid gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex flex-col gap-1">
            <span>Card Payment</span>
            <span className="text-muted-foreground text-sm">
              Pay with your credit card
            </span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal" className="flex flex-col gap-1">
            <span>PayPal</span>
            <span className="text-muted-foreground text-sm">
              Pay with your PayPal account
            </span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank" className="flex flex-col gap-1">
            <span>Bank Transfer</span>
            <span className="text-muted-foreground text-sm">
              Pay directly from your bank
            </span>
          </Label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" disabled />
        <Label htmlFor="option-2" className="text-muted-foreground">
          Option 2 (Disabled)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="option-2" />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithForm: Story = {
  render: () => (
    <form className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Shipping Method</h3>
        <p className="text-muted-foreground text-sm">
          Select your preferred shipping method.
        </p>
      </div>
      <RadioGroup defaultValue="standard">
        <div className="grid gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex flex-col gap-1">
              <span>Standard Shipping</span>
              <span className="text-muted-foreground text-sm">
                Delivery in 3-5 business days
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="express" id="express" />
            <Label htmlFor="express" className="flex flex-col gap-1">
              <span>Express Shipping</span>
              <span className="text-muted-foreground text-sm">
                Delivery in 1-2 business days
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="overnight" id="overnight" />
            <Label htmlFor="overnight" className="flex flex-col gap-1">
              <span>Overnight Shipping</span>
              <span className="text-muted-foreground text-sm">
                Delivery by next business day
              </span>
            </Label>
          </div>
        </div>
      </RadioGroup>
    </form>
  ),
};
