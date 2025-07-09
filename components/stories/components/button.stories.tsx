import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const meta = {
  component: Button,
  args: {
    onClick: fn(),
    children: "Button",
    disabled: false,
    "aria-invalid": false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ["default", "outlined", "secondary"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    children: <><Heart /> Love</>
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary"
  },
};

export const Outline: Story = {
  args: {
    variant: "outline"
  },
};
