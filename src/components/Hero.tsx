import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ArticleIcon from '@mui/icons-material/Article';

import { Container, Stack, IconButton, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const buttonHoverStyle = {
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#0099D8",
    backgroundColor: "transparent",
  },
};

const WORDS = ["software engineer", "public transportation enthusiast", "UC Berkeley graduate", "problem solver", "lifelong learner", "team player" ]

export default function Hero() {

    //We create a set of variables, and then the setter method, and then we initialize the const
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [word, setWord] = useState(WORDS[0]);

    useEffect(() => {
    //If we are deleting, we want to type faster, otherwise we want to type slower:
    const speed = deleting ? 80 : 150;
    
    const timer = setTimeout(() => {
        if (!deleting) {
            setText(word.substring(0, index + 1));
            setIndex(index + 1);
            
            //Reached the end of the word, pause here:
            if (index + 1 === word.length) {
                setTimeout(() => setDeleting(true), 1000);
            }
        } 
        else {
            setText(word.substring(0, index - 1));
            setIndex(index - 1);

            //Completely deleted, start typing again:
            if (index - 1 === 0) {
                setTimeout(() => setDeleting(false), 250);
                //Select a new word for the list of words:
                const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
                setWord(newWord);
            }
        }
    }, speed);

    return () => clearTimeout(timer);
    }, [index, deleting]);


    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            <Typography variant="h2">
                Hi! I'm Franz 👋
            </Typography>

            <Typography variant="h5">
                I am a 
                <span className="blueText"> {text}</span>
                <span className="cursor">|</span>
            </Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>
                Software Engineer, EECS from UC Berkeley
            </Typography>

            {/* We add a box to center the entire button group */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                {/* Stack to handle the layout between the buttons */}
                <Stack direction="row" spacing={3}>
                    <IconButton href="https://franzkieviet.com/resume" target="_blank" size="medium" sx={buttonHoverStyle}>
                        <ArticleIcon fontSize="large"/>
                    </IconButton>
                    <IconButton href="https://github.com/franzkieviet" target="_blank" size="medium" sx={buttonHoverStyle}>
                        <GitHubIcon fontSize="large"/>
                    </IconButton>
                    <IconButton href="https://linkedin.com/in/franz-kieviet" target="_blank" size="medium" sx={buttonHoverStyle}>
                        <LinkedInIcon fontSize="large"/>
                    </IconButton>
                </Stack>
            </Box>
            
        </Container>


    );
}