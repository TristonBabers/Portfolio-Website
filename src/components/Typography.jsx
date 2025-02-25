// components/Typography.js
import { Typography } from "@mui/material";

export const Heading = ({ children }) => (
  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 4, mb: 2 }}>
    {children}
  </Typography>
);

export const Subheading = ({ children }) => (
  <Typography variant="h5" sx={{ fontWeight: "medium", mt: 3, mb: 1 }}>
    {children}
  </Typography>
);

export const Paragraph = ({ children }) => (
  <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 1, mb: 2 }}>
    {children}
  </Typography>
);