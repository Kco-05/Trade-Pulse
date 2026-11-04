package com.tradepulse.ui.controller;

import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;

final class FacesMessages {

    private FacesMessages() {
    }

    static void error(String summary) {
        FacesContext.getCurrentInstance()
                .addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, summary, null));
    }
}
