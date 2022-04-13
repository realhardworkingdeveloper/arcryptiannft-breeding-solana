import { CandyMachineAccount } from './candy-machine';
import { useEffect, useState, useRef } from 'react';
import { BreedingStatus, NFTData } from './utils';

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



// const males: nftData[] = [
//   {
//     name: "Arcryptian_test0 #0",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
//   {
//     name: "Arcryptian_test0 #1",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
//   {
//     name: "Arcryptian_test0 #2",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
//   {
//     name: "Arcryptian_test0 #3",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
// ];

// const females: nftData[] = [
//   {
//     name: "Arcryptian_test0 #2",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
//   {
//     name: "Arcryptian_test0 #3",
//     image: "https://arweave.net/nIb93MJOgLuD9kDxCLxR8GCVcbnmZdzYA3_sREx2Ni0?ext=jpg"
//   },
// ];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    image: {
      width: '100%',
      maxWidth: 200,
      height: '100%',
    },
    formControl: {
      width: '100%',
      maxWidth: 200,
      border: "1px solid black !important",
      borderRadius: 5,
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
      borderRadius: 10
    },
  }),
);

export const ParentChooseButton = ({
  setMale,
  setFemale,
  setBreedingStatus,
  maleList,
  femaleList
}: {
  setMale: (val: NFTData) => void;
  setFemale: (val: NFTData) => void;
  setBreedingStatus: (val: BreedingStatus) => void;
  maleList: NFTData [];
  femaleList: NFTData [];
}) => {
  console.log(maleList);
  const [showModal, setShowModal] = useState(false);

  const [chosenMale, setChosenMale] = useState<NFTData>();
  const [chosenFemale, setChosenFemale] = useState<NFTData>();

  const classes = useStyles();

  const handleMaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    let male = maleList.find(item => item.name === event.target.value);
    setChosenMale(male);
  };

  const handleFemaleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    let female = femaleList.find(item => item.name === event.target.value);
    setChosenFemale(female);
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
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
                    maleList.map(male => 
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
                    femaleList.map(female => 
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
              <img className={'preview'} src={ chosenMale?.image ? chosenMale.image : "/img/no-image.png"} />
              <Paper className={'selected_name'} elevation={3} >
                {chosenMale ? chosenMale.name : 'No selected'}
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <img className={'preview'} src={ chosenFemale?.image ? chosenFemale.image : "/img/no-image.png"} />
              <Paper className={'selected_name'} elevation={3} >
                {chosenFemale ? chosenFemale.name : 'No selected'}
              </Paper>
            </Grid>

            <Grid item xs={6}>
            </Grid>

            <Grid item xs={3}>
              <Button
              onClick={() => {
                if(chosenMale && chosenFemale) {
                  setMale(chosenMale);
                  setFemale(chosenFemale);
                  setBreedingStatus({
                    status: 'READYTOSTART'
                  })
                  setShowModal(false);
                }
              }}
                variant="contained"
              >
                Select
              </Button>
            </Grid>

            <Grid item xs={3}>
              <Button
                variant="contained"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </Grid>

          </Grid>
        </div>
      </Modal>
    </>
  );
};
