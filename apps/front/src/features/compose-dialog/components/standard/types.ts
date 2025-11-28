export interface FieldIdGroup {
  control: string;
  description: string;
  status: string;
  error: string;
}

export interface ComposerFieldIds {
  server: FieldIdGroup;
  visibility: FieldIdGroup;
  localOnly: FieldIdGroup;
  content: FieldIdGroup;
  attachments: FieldIdGroup;
}

export const createComposerFieldIds = (baseId: string): ComposerFieldIds => ({
  server: {
    control: `${baseId}-server-control`,
    description: `${baseId}-server-description`,
    status: `${baseId}-server-status`,
    error: `${baseId}-server-error`,
  },
  visibility: {
    control: `${baseId}-visibility-control`,
    description: `${baseId}-visibility-description`,
    status: `${baseId}-visibility-status`,
    error: `${baseId}-visibility-error`,
  },
  localOnly: {
    control: `${baseId}-local-control`,
    description: `${baseId}-local-description`,
    status: `${baseId}-local-status`,
    error: `${baseId}-local-error`,
  },
  content: {
    control: `${baseId}-content-control`,
    description: `${baseId}-content-description`,
    status: `${baseId}-content-status`,
    error: `${baseId}-content-error`,
  },
  attachments: {
    control: `${baseId}-attachments-control`,
    description: `${baseId}-attachments-description`,
    status: `${baseId}-attachments-status`,
    error: `${baseId}-attachments-error`,
  },
});
