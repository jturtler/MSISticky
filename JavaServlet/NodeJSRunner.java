import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class DemoServlet
 */
@WebServlet("/NodeJSRunner")
public class NodeJSRunner extends HttpServlet {
	private static final long serialVersionUID = 1L;

	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public NodeJSRunner() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	      
		String outputMsg = "";
		
		try
		{	
			String nodeJSName = getParam( request, "node" );
			
			if ( nodeJSName.isEmpty() )
			{
				// empty case..   <-- should display message..	
				outputMsg = "node name is emtpy";
			}
			else
			{	
				// STEP 1. Compose 'node ---' execute command with parameters
				String nodeJSNameWtExtension = nodeJSName.replaceFirst(".js", "_");
				
				// get url parameters as '[---]:--' type, with exception of -> node/fileLoc/... used at here.
				String nodeParameterStr = parseNodeJSParams( request );

				String locDirStr = ( !getParam( request, "fileLoc" ).isEmpty() ) ? getParam( request, "fileLoc" ) : "/tmp/nodejs/";

				String executeStatement = locDirStr + nodeJSName + nodeParameterStr;
				//String executeStatement = "node /tmp/nodejs/" + nodeJSName + nodeParameterStr;


				// STEP 2. Optional output log file and background processing
				if ( getParam( request, "withLog" ).equals( "Y" ) ) executeStatement += " > " + locDirStr + nodeJSNameWtExtension + "_log.txt";
				
				if ( getParam( request, "showMsg" ).equals( "Y" ) ) outputMsg += "Execute: " + executeStatement;
				
				if ( getParam( request, "bgProcess" ).equals( "Y" ) ) 
				{
					String cmd = "/bin/sh /tmp/nodejs/runner.sh " + executeStatement;				
					
					// STEP 4. Set for displaying the 'executeStatement' on web as return output
					// And Execute the command.
					//if ( getParam( request, "showMsg" ).equals( "Y" ) ) outputMsg += "Execute: " + executeStatement;
					outputMsg += "<div class='divOutput'>Output: " + getProcessedMessage( Runtime.getRuntime().exec( cmd ) ) + "</div>";
				}
				else
				{
					// STEP 3. Set as String Array and 'sh', so that background processing is possible
					//String[] cmd = {"/bin/sh", "-c", executeStatement};				
					//String cmd = "/bin/sh -c " + executeStatement;				
					String cmd = "/usr/bin/node " + executeStatement;				
					
					// STEP 4. Set for displaying the 'executeStatement' on web as return output
					// And Execute the command.
					//if ( getParam( request, "showMsg" ).equals( "Y" ) ) outputMsg += "Execute: " + executeStatement;
					outputMsg += "<div class='divOutput'>Output: " + getProcessedMessage( Runtime.getRuntime().exec( cmd ) ) + "</div>";					
				}
								
				//String dateStr = new SimpleDateFormat( "yyyy-MM-dd" ).format( new Date() );
				//outputMsg += getProcessedMessage( Runtime.getRuntime().exec( "whoami" ) );
				//outputMsg += "\n<br>" + getProcessedMessage( Runtime.getRuntime().exec( "echo testing" ) );
							
			}
						
		}
		catch ( IOException ex )
		{
			outputMsg = ex.getMessage();
		}
		catch( Exception ex )
		{
			outputMsg = ex.toString();			
		}
		

		// output the message as html.
		response.setContentType( "text/html" );

		PrintWriter out = response.getWriter();
		out.println( "<!DOCTYPE><HTML><body>" + outputMsg + "</body></HTML>" );
		//out.flush();	
	}

	
	private static String getProcessedMessage( Process p ) throws Exception
	{
		String outputMsg = ""; 
		String line;
		
	   BufferedReader in = new BufferedReader( new InputStreamReader(p.getInputStream()) );
	   while ( (line = in.readLine() ) != null ) 
	   {
		   outputMsg += line;
	   }
	   
	   in.close();	
	   
	   return outputMsg;
	}
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{
		// TODO Auto-generated method stub
	}
	
	
	// -------------------------------------------------------------------

	
	private String getParam( HttpServletRequest request, String paramName ) throws Exception, IOException 
	{		
		String paramValue = request.getParameter( paramName );		
		
		if ( paramValue == null || paramValue.isEmpty() ) paramValue = "";
		
		return paramValue;
	}
	
	
	private String parseNodeJSParams( HttpServletRequest request ) throws Exception, IOException 
	{
		String paramsStr = "";
		boolean sourceTypeProvided = false;
		
		Set<String> parameterNames = request.getParameterMap().keySet();

		for ( Entry<String, String[]> entry : request.getParameterMap().entrySet() ) 
		{
		    String name = entry.getKey();
		    String value = entry.getValue()[0];  // if more than one value, just get 1st one.
		    
		    // if 'sourceType' is provided and is 'WebApp', then pass through to nodeJS
		    // otherwise, 'sourceType' should be set as 'WebUrl'
		    if ( name.equals( "sourceType" ) && value.equals( "WebApp" ) )
		    {
		    	paramsStr += " [" + name + "]:" + value;	
		    	sourceTypeProvided = true;
		    }		    
		    else if ( !name.equals( "node" ) 
			    	&& !name.equals( "showMsg" ) 
			    	&& !name.equals( "fileLoc" ) 
			    	&& !name.equals( "withLog" ) 
			    	&& !name.equals( "bgProcess" ) 
		    	)
		    {
		    	paramsStr += " [" + name + "]:" + value;
		    }
		}
		
		
		if ( !sourceTypeProvided ) paramsStr += " [sourceType]:WebUrl";
		
		return paramsStr;
	}
		

	// ---------------- Utils ----------------------------------------

	// convert InputStream to String
	private static String getStringFromInputStream( InputStream is ) {
 
		BufferedReader br = null;
		StringBuilder sb = new StringBuilder();
 
		String line;
		try {
 
			br = new BufferedReader( new InputStreamReader( is ) );
			while ( ( line = br.readLine() ) != null ) {
				sb.append( line );
			}
 
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
 
		return sb.toString();
	}
	
}
