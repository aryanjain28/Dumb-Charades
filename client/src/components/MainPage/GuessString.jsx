import { Box, Grid, Typography } from "@mui/material";

const GuessString = (props) => {
  const { text } = props;
  return (
    <Typography letterSpacing={1} variant="caption">
      {text}
    </Typography>
  );
};

export default GuessString;
