import { Box, Grid, Typography } from "@mui/material";

const GuessString = (props) => {
  const { text } = props;
  return (
    <Typography letterSpacing={15} variant="h2">
      {text}
    </Typography>
  );
};

export default GuessString;
