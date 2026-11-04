package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.WalletClient;
import com.tradepulse.ui.dto.UserView;
import com.tradepulse.ui.exception.ApiException;
import jakarta.enterprise.context.RequestScoped;
import jakarta.faces.context.ExternalContext;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.servlet.http.HttpServletRequest;

@Named
@RequestScoped
public class AuthBean {

    private static final String HOME = "market?faces-redirect=true";
    private static final String LOGIN = "login?faces-redirect=true";

    private final WalletClient walletClient;
    private final UserSession userSession;

    private String username;
    private String password;

    protected AuthBean() {
        this(null, null);
    }

    @Inject
    public AuthBean(WalletClient walletClient, UserSession userSession) {
        this.walletClient = walletClient;
        this.userSession = userSession;
    }

    public String login() {
        try {
            return signIn(walletClient.login(username.trim(), password));
        } catch (ApiException e) {
            FacesMessages.error(e.getMessage());
            return null;
        } finally {
            password = null;
        }
    }

    public String register() {
        try {
            return signIn(walletClient.register(username.trim(), password));
        } catch (ApiException e) {
            FacesMessages.error(e.getMessage());
            return null;
        } finally {
            password = null;
        }
    }

    public String logout() {
        FacesContext.getCurrentInstance().getExternalContext().invalidateSession();
        return LOGIN;
    }

    private String signIn(UserView user) {
        ExternalContext external = FacesContext.getCurrentInstance().getExternalContext();
        HttpServletRequest request = (HttpServletRequest) external.getRequest();
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        userSession.signIn(user);
        return HOME;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
