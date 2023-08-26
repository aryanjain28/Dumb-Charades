import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import axios from "axios";

const GuessString = ({ isHost }) => {
  const [movie, setMovie] = useState("");

  useEffect(() => {
    if (isHost) getMovie();
  }, [isHost]);

  const getMovie = async () => {
    const page = Math.floor(Math.random() * 201);
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=4b470fed996e4925f1f6757cda528d08&sort_by=popularity.desc&page=${page}&with_original_language=en`;
    const { results } = (await axios.get(url)).data;
    const movie = results[Math.floor(Math.random() * results.length)];
    setMovie(movie.original_title);
  };

  return (
    <Typography letterSpacing={1} variant="h5">
      {movie}
    </Typography>
  );
};

export default GuessString;
