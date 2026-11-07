package com.tradepulse.ui.config;

import com.tradepulse.ui.controller.UserSession;
import jakarta.inject.Inject;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Set;

public class AuthFilter extends HttpFilter {

    private static final String LOGIN_PAGE = "/login.xhtml";
    private static final String RESOURCE_KEYWORD = "jakarta.faces.resource";
    private static final Set<String> PUBLIC_PAGES = Set.of(
            "/",
            "",
            "/market.xhtml",
            "market.xhtml",
            "/login.xhtml",
            "login.xhtml",
            "/register.xhtml",
            "register.xhtml"
    );
    private static final Set<String> PROTECTED_PAGES = Set.of(
            "/portfolio.xhtml",
            "portfolio.xhtml",
            "/history.xhtml",
            "history.xhtml"
    );

    // Tomcat creates filters itself, so Weld can only inject fields here, not constructors.
    @Inject
    private UserSession userSession;

    public AuthFilter() {
    }

    AuthFilter(UserSession userSession) {
        this.userSession = userSession;
    }

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (isPublicPath(request)) {
            chain.doFilter(request, response);
            return;
        }

        if (isAuthenticated(request)) {
            chain.doFilter(request, response);
            return;
        }

        redirectToLogin(request, response);
    }

    private boolean isPublicPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri != null && uri.contains(RESOURCE_KEYWORD)) {
            return true;
        }
        String servletPath = request.getServletPath();
        if (servletPath != null && servletPath.contains(RESOURCE_KEYWORD)) {
            return true;
        }
        String pathInfo = request.getPathInfo();
        if (pathInfo != null && pathInfo.contains(RESOURCE_KEYWORD)) {
            return true;
        }

        String path = resolvePath(request);
        return PUBLIC_PAGES.contains(path) || path.contains(RESOURCE_KEYWORD);
    }

    private boolean isProtectedPath(HttpServletRequest request) {
        String path = resolvePath(request);
        return PROTECTED_PAGES.contains(path)
                || path.endsWith("/portfolio.xhtml")
                || path.endsWith("/history.xhtml");
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return false;
        }
        return userSession != null && userSession.isLoggedIn();
    }

    private String resolvePath(HttpServletRequest request) {
        String servletPath = request.getServletPath();
        if (servletPath != null && !servletPath.isEmpty()) {
            return servletPath;
        }
        String pathInfo = request.getPathInfo();
        if (pathInfo != null && !pathInfo.isEmpty()) {
            return pathInfo;
        }
        String uri = request.getRequestURI();
        if (uri != null) {
            String contextPath = request.getContextPath();
            if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
                return uri.substring(contextPath.length());
            }
            return uri;
        }
        return "";
    }

    private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
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
