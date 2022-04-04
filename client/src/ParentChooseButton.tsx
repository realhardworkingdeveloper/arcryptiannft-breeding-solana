import { CandyMachineAccount } from './candy-machine';
import { useEffect, useState, useRef } from 'react';
import { BreedingStatus } from './utils';

import {
  Paper,
  Grid,
  Modal,
  Button,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  ButtonBase,
  Typography
} from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import './ParentChooseModal.css';

interface nftData {
  name: string;
  image: string;
}

const males: nftData[] = [
  {
    name: "Arcryptian_test0 #0",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
  {
    name: "Arcryptian_test0 #1",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
  {
    name: "Arcryptian_test0 #2",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
  {
    name: "Arcryptian_test0 #3",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
];

const females: nftData[] = [
  {
    name: "Arcryptian_test0 #2",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
  {
    name: "Arcryptian_test0 #3",
    image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
  },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    preview: {
      width: '100%',
      height: 252
    },
    card: {
      margin: 0,
      padding: 0,
    },
    description:{
      position: 'absolute',
      bottom: 0,
      background: 'rgba(3, 3, 3, 0.6)',
      fontSize: 24,
      width: '100%',
      textAlign: 'center'
    },
    selected_name: {
      top: 0,
      background: 'rgba(3, 3, 3, 0.6)',
      fontSize: 20,
      width: '100%',
      textAlign: 'center'
    },
    image: {
      width: '100%',
      maxWidth: 200,
      height: '100%'
    },
    formControl: {
      width: '100%',
      maxWidth: 200,
    },
    body: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      width: 400,
      height: 470,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4),
    },
  }),
);

export const ParentChooseButton = ({
  candyMachine,
  setBreedingStatus,
  maleList,
  femaleList
}: {
  candyMachine?: CandyMachineAccount;
  setBreedingStatus: (val: BreedingStatus) => void;
  maleList: any [];
  femaleList: any [];
}) => {
  const [showModal, setShowModal] = useState(false);

  const [male, setMale] = useState<nftData | undefined>(undefined);
  const [female, setFemale] = useState<nftData | undefined>(undefined);

  const classes = useStyles();

  const handleMaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    let male = males.find(item => item.name === event.target.value);
    setMale(male);
  };

  const handleFemaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    let female = females.find(item => item.name === event.target.value);
    setFemale(female);
  };

  return (
    <>
      <Button
        onClick={() => {
            setShowModal(true);
        }}
      >
        Choose Parents
      </Button>
      <Modal
        open={showModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.body}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                Please select adult arcryptians.
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl variant="filled" className={classes.formControl}>
                <InputLabel id="male-select-label">Male</InputLabel>
                <Select
                  labelId="male-select-label"
                  value=''
                  onChange={handleMaleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {
                    males.map(male => 
                      <MenuItem value={male.name} key={male.name}>
                        <ButtonBase className={classes.card}>
                          <img className={classes.image} alt="complex" src={male.image} />
                          <Paper className={classes.description} elevation={3} >
                            {male.name}
                          </Paper>
                        </ButtonBase>
                      </MenuItem>
                    )
                  }
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl variant="filled" className={classes.formControl}>
                <InputLabel id="male-select-label">Female</InputLabel>
                <Select
                  labelId="male-select-label"
                  value=''
                  onChange={handleFemaleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {
                    females.map(female => 
                      <MenuItem value={female.name} key={female.name}>
                        <ButtonBase className={classes.card}>
                          <img className={classes.image} alt="complex" src={female.image} />
                          <Paper className={classes.description} elevation={3} >
                            {female.name}
                          </Paper>
                        </ButtonBase>
                      </MenuItem>
                    )
                  }
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <img className={classes.preview} src={ male?.image ? male.image : "/img/no-image.png"} />
              <Paper className={classes.selected_name} elevation={3} >
                {male ? male.name : 'No selected'}
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <img className={classes.preview} src={ female?.image ? female.image : "/img/no-image.png"} />
              <Paper className={classes.selected_name} elevation={3} >
                {female ? female.name : 'No selected'}
              </Paper>
            </Grid>

            <Grid item xs={6}>
            </Grid>

            <Grid item xs={3}>
              <Button variant="contained">Select</Button>
            </Grid>

            <Grid item xs={3}>
              <Button variant="contained">Cancel</Button>
            </Grid>

          </Grid>
        </div>
      </Modal>
    </>
  );
};
