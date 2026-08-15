import LocationPinIcon from '@mui/icons-material/LocationPin';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { siPython, siSharp, siDotnet, siTerraform, siIcloud, siReact, siGit, siDjango, siNodedotjs, siBuymeacoffee, siDocker, siKubernetes, siOpencv } from 'simple-icons/icons';

import { Container, IconButton, Box, Typography } from "@mui/material";

const gold = "2px solid gold"
const silver = "2px solid silver"
const bronze = "2px solid #65401bff"
const location = "Orange County, CA"
const jobTitle = "Full Stack Software Engineer II"
const company = "Pacific Life"

const techStack = [
  {name: "Python", icon: siPython, border: gold},
  {name: "Git", icon: siGit, border: gold},
  {name: "C#", icon: siSharp, border: silver},
  {name: "Terraform", icon: siTerraform, border: silver},
  {name: "AWS", icon: siIcloud, border: silver},
  {name: "OpenCv", icon: siOpencv, border: silver},
  {name: "DotNet", icon: siDotnet, border: bronze},
  {name: "React", icon: siReact, border: bronze},
  {name: "Django", icon: siDjango, border: bronze},
  {name: "Java", icon: siBuymeacoffee, border: bronze},
  {name: "Node.js", icon: siNodedotjs, border: bronze},
  {name: "Docker", icon: siDocker, border: bronze},
  {name: "Kubernetes", icon: siKubernetes, border: bronze}   
];

const bartBlue = "#0099D8";

const quickFactBox = {
    backgroundColor: "white",
    borderRadius: 2,
    padding: 1.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 1,
    textAlign: "left",
    boxSizing: "border-box",
    // Fill the grid cell width
    width: "100%",
    // smooth hover transitions
    transition: "transform 0.22s ease, box-shadow 0.22s ease",
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.12), 0 6px 6px rgba(0,0,0,0.08)",
        backgroundColor: "white",
        zIndex: 2,
    }
}

const logoDevStyle = {
    width: 24,
    height: 24,
    "& svg": {
        width: 24,
        height: 24,
        fill: bartBlue,
    },
};

const quickFactTextBox = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    ml: 1
};

const quickFactTitle = {
    fontWeight: "bold", 
    fontSize: "0.65rem", 
    color: "gray"
};

const quickFactText = {
    fontSize: "0.8rem",
    color: "black" 
};

export default function About() {
    return (
        <Box id="about" sx={{ width: "100%", bgcolor: "#c2e7f6ff", py: 1 }}>
            <Container maxWidth="md" sx={{ borderRadius: 2, p: 3 }}>
                <Typography className="sectionTitle" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: '800' }}>
                    <span className="sectionTitleUnderline">About Me:</span>
                </Typography>

                {/*Quick Facts */}
                <Typography className="subSectionTitle" sx={{ py:2, fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: '500' }}>
                    <span> QUICK FACTS</span>
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center"}}>
                    {/* Responsive container for the quick-fact boxes (wraps on small screens) */}
                    <Box sx={{
                        display: "grid",
                        gap: 3,
                        // 1 column on xs, 2 columns on sm+, 4 columns on md+
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                        width: "100%",
                        alignItems: "stretch",
                        justifyContent: "center",
                    }}>
                        <IconButton size="medium" sx={quickFactBox}>
                            <WorkIcon fontSize="large" sx={{ color: bartBlue }}/>
                            <Box sx={quickFactTextBox}>
                                <span style={{ marginLeft: 2 }}>
                                    <Typography sx={quickFactTitle}>
                                        OCCUPATION
                                    </Typography>
                                </span>
                                <span style={{ marginLeft: 2}}>
                                    <Typography sx={quickFactText}>
                                        {jobTitle} at {company}
                                    </Typography>
                                </span>
                            </Box>
                        </IconButton>
                        <IconButton size="medium" sx={quickFactBox}>
                            <SchoolIcon fontSize="large" sx={{ color: bartBlue }}/>
                            <Box sx={quickFactTextBox}>
                                <span style={{ marginLeft: 2 }}>
                                    <Typography sx={quickFactTitle}>
                                        EDUCATION
                                    </Typography>
                                </span>
                                <span style={{ marginLeft: 2}}>
                                    <Typography sx={quickFactText}>
                                        B.S. Electrical Engineering &
                                        Computer Science, UC Berkeley
                                    </Typography>
                                </span>
                            </Box>
                        </IconButton>
                        <IconButton size="medium" sx={quickFactBox}>
                            <LocationPinIcon fontSize="large" sx={{ color: bartBlue }}/>
                            <Box sx={quickFactTextBox}>
                                <span style={{ marginLeft: 2 }}>
                                    <Typography sx={quickFactTitle}>
                                        LOCATION
                                    </Typography>
                                </span>
                                <span style={{ marginLeft: 2}}>
                                    <Typography sx={quickFactText}>
                                        {location}
                                    </Typography>
                                </span>
                            </Box>
                        </IconButton>
                        <IconButton size="medium" sx={quickFactBox}>
                            <RocketLaunchIcon fontSize="large" sx={{ color: bartBlue }}/>
                            <Box sx={quickFactTextBox}>
                                <span style={{ marginLeft: 2 }}>
                                    <Typography sx={quickFactTitle}>
                                        INTEREST
                                    </Typography>
                                </span>
                                <span style={{ marginLeft: 2}}>
                                    <Typography sx={quickFactText}>
                                        Computer Vision
                                    </Typography>
                                </span>
                            </Box>
                        </IconButton>
                    </Box> 
                </Box>
                
                {/* LANGUAGES, FRAMEWORKS, & TOOLS */}
                <Typography className="subSectionTitle" sx={{ py:2, fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: '500' }}>
                    <span> LANGUAGES, FRAMEWORKS, & TOOLS</span>
                </Typography>
                
                <Box sx={{py:2, display: "flex", justifyContent: "center"}}>
                    {/* Responsive container for the quick-fact boxes (wraps on small screens) */}
                    <Box sx={{
                        display: "grid",
                        gap: 3,
                        // 1 column on xs, 2 columns on sm+, 4 columns on md+
                        gridTemplateColumns: { xs: "1fr 1fr 1fr", sm: "1fr 1fr 1fr 1fr 1fr", md: "1fr 1fr 1fr 1fr 1fr 1fr 1fr" },
                        width: "100%",
                        alignItems: "stretch",
                        justifyContent: "center",
                    }}>
                        {techStack.map((tech) => (
                        <Box
                            key={tech.name}
                            sx={{ ...quickFactBox, border: tech.border }}
                        >
                            <Box
                            sx={logoDevStyle}
                            dangerouslySetInnerHTML={{ __html: tech.icon.svg }}
                            />

                            <Typography sx={quickFactTitle}>
                            {tech.name}
                            </Typography>
                        </Box>
                        ))}
                        <Box>
                            <Typography className="subSectionTitle" sx={{fontSize: { xs: '.6rem', md: '.6rem' }, fontWeight: '500' }}>
                                <span> Outline denotes proficiency: Gold: Advanced, Silver: Intermediate, Bronze: Beginner</span>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                </Container>
            </Box>
    );
}