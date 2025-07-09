import React from 'react';
import type { Preview } from '@storybook/react-vite'
import '@/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      exclude: ["asChild"],
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    parameters: {
      actions: { argTypesRegex: '^on.*' },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      if (context.globals.theme === "dark") {
        document.body.classList.add("dark")
      } else {
        document.body.classList.remove("dark")
      }
        return <Story />
    },
  ]
};

export default preview;
