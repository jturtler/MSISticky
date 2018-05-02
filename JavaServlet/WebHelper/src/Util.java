

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.tomcat.util.codec.binary.Base64;
import org.json.JSONArray;
import org.json.JSONObject;

import com.sun.istack.internal.logging.Logger;


public class Util 
{

	// public static final String VERSION_STR = "v 1.04";

	// public static String REQUEST_PARAM_USERNAME = "usr";

	// ------- CLIENT ATTRIBUTE ---------------------
	public static final String CONTENT_TYPE_JSON = "application/json";

    public static boolean DEBUG_FLAG = true;
    
	// Sandbox server
	public static String DB_DBNAME = "";
	public static String DB_USERNAME = "";
	public static String DB_PASSWORD = "";
	
	// ============================================================
	
    public Util() {
        //super();
        // TODO Auto-generated constructor stub
    }

	// =============================================================
	
    
	// ====================================================
	// ============ INPUT / OUTPUT / RESPONSE RELATED ===============


	// Convert InputStream to String
	public static JSONObject getJsonFromInputStream( InputStream is ) throws Exception
	{
		JSONObject jsonData = null;
		
		BufferedReader br = null;
		StringBuilder sb = new StringBuilder();
 
		String line;
		try {
 
			br = new BufferedReader( new InputStreamReader( is ) );
			while ( ( line = br.readLine() ) != null ) {
				sb.append( line );
			}
			
			jsonData = new JSONObject( sb.toString() );
			
		} catch (IOException e) 
		{
			e.printStackTrace();
			
		} finally 
		{
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
			if ( jsonData == null ) throw new Exception( "== FAILED to get json inputStream" );
		}
		
		return jsonData;
	}

	
	public static void respondMsgOut( HttpServletResponse response, String contentType, int responseCode, String msg )
	{
		try
		{								
			PrintWriter out = response.getWriter();
	
			// No caching header
			response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
			response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
			response.setDateHeader("Expires", 0); // Proxies.
			
			response.setContentType( contentType );		
			response.setStatus( responseCode );		
	
			out.print( msg );
			out.flush();
		}
		catch ( Exception ex )
		{
            System.out.println( "\n\n=== EXCEPTION ERROR FORM respondMsgOut === \n" );
            // throw ex;
		}
	}	
	
	
	public static String getRequestPath( HttpServletRequest request, int positionIndex )
	{
		String pathName = "";
			
		try
		{
			// 1. get Keyword by part of url
			if ( request.getPathInfo() != null && request.getPathInfo().split("/").length >= ( positionIndex + 1 ) )
			{
				String[] queryPathList = request.getPathInfo().split("/");
								
				pathName = queryPathList[ positionIndex ];
			}
		}
		catch( Exception ex )
		{
			Util.outputErr( "\n == ERROR on 'getRequestPath()'\n" );
		}
		
		return pathName;
	}
	
	
	public static String getJSONAttr( JSONObject jsonData, String attrName ) throws Exception
	{
		return getJSONAttr( jsonData, attrName, "String" );
	}
	
	public static String getJSONAttr( JSONObject jsonData, String attrName, String type ) throws Exception
	{
		String output = "";

		try
		{
			if ( type.equals( "String") )
			{
				output = jsonData.get( attrName ).toString();
			}
		}
		catch( Exception ex )
		{
			System.out.println( "FAILED to get jsonAttr of " + attrName );
		}
		
		return output;
		//String tableName = ( receivedData.has( "tableName" ) ) ? receivedData( "tableName" ) : "";
	}


	public static String getJSONStrVal( JSONObject jsonDataInput, String key )
	{
		String output = "";
				
		if ( jsonDataInput != null && jsonDataInput.has( key ) )
		{
			//output = jsonDataInput.getString( key );					
			output = jsonDataInput.get( key ).toString();		
		}
		
		return output;
	}
		
	   	
   	public static JSONObject getJsonObject( JSONObject jsonObj, String propName )
   	{
   		JSONObject propJson = null;
   		
   		if ( jsonObj != null && jsonObj.has( propName ) )
   		{
   			propJson = jsonObj.getJSONObject( propName );
   		}
   		
   		return propJson;
   	}
   	

   	public static JSONObject getJsonObject( JSONArray jsonObjArr, String propName, String propVal )
   	{
   		JSONObject propJson = null;
   		
   		if ( jsonObjArr != null )
   		{   			
			for( int i = 0; i < jsonObjArr.length(); i++ )
			{
				JSONObject jsonObj = jsonObjArr.getJSONObject(i);
				
				String propValStr = Util.getJSONStrVal( jsonObj, propName );
				
				if ( propValStr.equals( propVal ) )
				{
					propJson = jsonObj;
					break;
				}
			}
   		}
   		
   		return propJson;
   	}
   	
   	public static JSONArray getJsonArray( JSONObject jsonObj, String propName )
   	{
   		JSONArray propJsonArr = null;
   		
   		if ( jsonObj != null && jsonObj.has( propName ) )
   		{
   			propJsonArr = jsonObj.getJSONArray( propName );
   		}
   		
   		return propJsonArr;
   	}
   	
	public static void setJsonArrPropVal( JSONArray jsonArr, String propName, Object val )
	{
		for ( int i = 0; i < jsonArr.length(); i++ )
		{
			JSONObject jsonObj = jsonArr.getJSONObject( i );
			
			jsonObj.put( propName, val );			
		}
	}

	
	public static Map<String, String> jsonToMap(JSONObject object) throws Exception
	{
	    Map<String, String> map = new HashMap<String, String>();

	    Iterator<String> keysItr = object.keys();
	    
	    while( keysItr.hasNext() ) 
	    {
	        String key = keysItr.next();
	        String value = object.get(key).toString();

	        map.put(key, value);
	    }
		    
	    return map;
	}
	
	public static String[] mapToDbStrings( Map<String, String> map ) throws Exception
	{
		String[] outputs = new String[2];
		
		String keys = "";
		String vals = "";
		
    	for ( Map.Entry<String, String> entry : map.entrySet() )
    	{
    		keys += ( ( keys.isEmpty() ) ? "": ", " ) + entry.getKey();
    		vals += ( ( vals.isEmpty() ) ? "": ", " ) + "'" + entry.getValue().replaceAll( "'", "''" ) + "'";
    	}	
    	
    	outputs[0] = keys;
    	outputs[1] = vals;
    	
    	return outputs;
	}
	

   	// ====================================
   	// ====== XML/JSON Config File Related ===========
   	
	public static void loadSetConfigData( ServletContext servletContext ) throws ServletException
	{
		  // Testing for file read!!
	    JSONObject configJson = Util.jsonConfigLoad( "config.json", servletContext );
	    
	    try
	    {
		    if ( configJson != null ) 
		    {		    		
		    	Util.DB_DBNAME = Util.getJSONStrVal( configJson, "DB_DBNAME" );
		    	Util.DB_USERNAME = Util.getJSONStrVal( configJson, "DB_USERNAME" );
		    	Util.DB_PASSWORD = Util.getJSONStrVal( configJson, "DB_PASSWORD" );
		    }
	    }
	    catch( Exception ex)
	    {
	    	Util.outputErr( "ERROR - on loadSetConfigData" );
	    	throw new ServletException( "ERROR - on loadSetConfigData" );
	    }	    			
	}
	
	public static JSONObject jsonConfigLoad( String fileName, ServletContext servletContext )
	{
		File configFile = null;
		JSONObject configJson = null;
		
		try
		{
		    String configFilePath = servletContext.getRealPath( "/" + fileName );		
			configFile = new File( configFilePath );
			
			if ( !configFile.isFile() ) throw new Exception( "Config file not found." );						
		}
		catch( Exception ex )
		{
			Util.outputErr( "Config file name with '" + fileName + "' not found." );
			// throw ex;
		}
		
		
		try
		{
			String configJsonStr = readFile( configFile.getPath(), StandardCharsets.UTF_8 );			
			configJson= new JSONObject( configJsonStr );
		}
		catch( Exception ex )
		{
			Util.outputErr( "Config file name with '" + fileName + "' not found." );
			// throw ex;
		}
		
		return configJson;
	}
	

   	public static String readFile(String path, Charset encoding) throws IOException 
   	{
		byte[] encoded = Files.readAllBytes( Paths.get( path ) );
		return new String(encoded, encoding);
   	}
   	
   	// ====================================
   	// ====== Outputing Related ===========

   	public static void output( String msg )
   	{
		//Util.output( Util.class, msg, DEBUG_FLAG );   		
		System.out.println( "\n === " + msg );
   	}

   	public static void output( String msg, boolean bShow )
   	{
		//Util.output( Util.class, msg, bShow );   		
		System.out.println( "\n === " + msg );
   	}

   	public static void output( Class<?> arg1, String msg, boolean bShow )
   	{
		if ( bShow ) Logger.getLogger( arg1 ).log( Level.INFO, "\n === " + msg + System.getProperty("line.separator") );
	}
   	
   	public static void outputErr( String msg )
   	{
		//Logger.getLogger( Util.class ).log( Level.INFO, "\n = = = = " + msg + System.getProperty("line.separator") );
		System.out.println( "\n = = = = " + msg );
   	}
   	
   	// =============================

}
