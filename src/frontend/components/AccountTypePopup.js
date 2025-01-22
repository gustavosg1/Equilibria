import React from "react";
import { Dialog, DialogTitle, DialogContent, Button, Box } from "@mui/material";

const AccountTypePopup = ({onClose, onSelect}) => {
    return(
        <Dialog open={true} onClose={onClose}>
            <DialogTitle> Selecciona el Tipo de Cuenta que Quieres</DialogTitle>
            <DialogContent> Que buscas aqui?
                <Box>
                    <Button onClick = { () => onSelect("client")}> Busco apoio psicológico </Button>
                    <Button onClick = { () => onSelect("psychologist")}> Busco ofrecer tratamento psícológico </Button>
                </Box>
            </DialogContent>

        </Dialog>

    )
}

export default AccountTypePopup;



