import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDatabase {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://localhost:3306/ecommerce_user?useSSL=false&allowPublicKeyRetrieval=true";
            Connection conn = DriverManager.getConnection(url, "root", "");
            
            // Insert mock user details
            PreparedStatement detailsStmt = conn.prepareStatement(
                "INSERT INTO users_details (first_name, last_name, email) VALUES (?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            detailsStmt.setString(1, "Test");
            detailsStmt.setString(2, "User");
            detailsStmt.setString(3, "test2@example.com");
            detailsStmt.executeUpdate();
            ResultSet detailsRs = detailsStmt.getGeneratedKeys();
            long detailsId = 0;
            if (detailsRs.next()) {
                detailsId = detailsRs.getLong(1);
            }
            
            // Check if ROLE_USER exists
            PreparedStatement roleCheck = conn.prepareStatement("SELECT id FROM user_role WHERE role_name = ?");
            roleCheck.setString(1, "ROLE_USER");
            ResultSet roleRs = roleCheck.executeQuery();
            long roleId = 0;
            if (roleRs.next()) {
                roleId = roleRs.getLong(1);
            } else {
                PreparedStatement roleInsert = conn.prepareStatement(
                    "INSERT INTO user_role (role_name) VALUES (?)",
                    Statement.RETURN_GENERATED_KEYS
                );
                roleInsert.setString(1, "ROLE_USER");
                roleInsert.executeUpdate();
                ResultSet newRoleRs = roleInsert.getGeneratedKeys();
                if (newRoleRs.next()) {
                    roleId = newRoleRs.getLong(1);
                }
            }
            
            // Insert user
            PreparedStatement userStmt = conn.prepareStatement(
                "INSERT INTO users (user_name, user_password, active, user_details_id, role_id) VALUES (?, ?, ?, ?, ?)"
            );
            userStmt.setString(1, "test_user_from_java");
            // 60-char BCrypt hash
            userStmt.setString(2, "$2a$10$w8.v/XmBv858vMpxv30Vfe6.rM0Tee82qYd0M7hB0sX73G7qYQ0zO");
            userStmt.setInt(3, 1);
            userStmt.setLong(4, detailsId);
            userStmt.setLong(5, roleId);
            userStmt.executeUpdate();
            
            System.out.println("User inserted successfully!");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
