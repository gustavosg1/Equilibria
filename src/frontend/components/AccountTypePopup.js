import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Divider,
  useTheme,
  styled
} from "@mui/material";
import PsychologyIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: 'white',
  padding: '16px 24px',
  margin: '8px 0',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
    transform: 'translateY(-2px)'
  },
  '& .MuiSvgIcon-root': {
    marginRight: '12px',
    fontSize: '1.5rem'
  }
}));

const AccountTypePopup = ({ onClose, onSelect }) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          minWidth: '400px',
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight="600">
          Selecciona Tu Perfil
        </Typography>
        <br></br>
        <Typography variant="body2" color="text.secondary" mt={1}>
          ¿Qué tipo de cuenta necesitas?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <StyledButton 
            onClick={() => onSelect("client")}
          >
            <PersonIcon size={200} style={{ marginRight: '10px' }}/>
            Busco apoyo psicológico
          </StyledButton>

          <StyledButton 
            onClick={() => onSelect("psychologist")}
          >
            <PsychologyIcon size={200} style={{ marginRight: '10px' }}/>
            Soy profesional
          </StyledButton>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

export default AccountTypePopup;