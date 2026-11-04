package com.tradepulse.ui.config;

import com.tradepulse.ui.controller.UserSession;
import jakarta.inject.Inject;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;

public class AuthFilter extends HttpFilter {

    private static final String LOGIN_PAGE = "/login.xhtml";
    private static final Set<String> PUBLIC_PAGES = Set.of(LOGIN_PAGE, "/register.xhtml");
    private static final String RESOURCE_PREFIX = "/jakarta.faces.resource/";

    // Tomcat creates filters itself, so Weld can only inject fields here, not constructors.
    @Inject
    private UserSession userSession;

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String path = request.getServletPath();
        if (PUBLIC_PAGES.contains(path) || path.startsWith(RESOURCE_PREFIX) || userSession.isLoggedIn()) {
            chain.doFilter(request, response);
            return;
        }

        String loginUrl = request.getContextPath() + LOGIN_PAGE;
        if ("partial/ajax".equals(request.getHeader("Faces-Request"))) {
            // A plain 302 is ignored by Faces AJAX; it needs a partial-response redirect instead.
            response.setContentType("text/xml");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<partial-response><redirect url=\"" + loginUrl + "\"/></partial-response>");
        } else {
            response.sendRedirect(loginUrl);
        }
    }
}
